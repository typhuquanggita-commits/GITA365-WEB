/* ═══════════════════════════════════════════════════════════════
   GITA 365 · v7.0 — ĐA NGÔN NGỮ / MULTILINGUAL
   Tiếng Việt là ngôn ngữ gốc của tri thức. Tiếng Anh phủ toàn bộ
   giao diện, la bàn văn hoá, năm tầng và bản đồ điểm chạm.
   Thêm ngôn ngữ mới: chép khối 'en' và dịch — không phải sửa mã.
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;

G.LANGS = [
  {k:'vi', n:'Tiếng Việt', flag:'VI', done:100},
  {k:'en', n:'English',    flag:'EN', done:100}
];
G.LANG = 'vi';

/* Lấy trường theo ngôn ngữ: tx(o,'t') → o.t_en khi đang EN, ngược lại o.t */
G.tx = function(o, f){
  if(!o) return '';
  if(G.LANG !== 'vi' && o[f+'_'+G.LANG] !== undefined) return o[f+'_'+G.LANG];
  return o[f];
};
G.L = function(k){
  var d = G.UI[G.LANG] || G.UI.vi;
  var goc = (d[k] !== undefined) ? d[k] : (G.UI.vi[k] !== undefined ? G.UI.vi[k] : k);
  /* Super Admin sửa được chữ giao diện ngay trong ứng dụng — xem src/sua-noi-dung.js */
  return G.nd ? G.nd('chu.' + k, goc) : goc;
};

/* ══════════ CHUỖI GIAO DIỆN ══════════ */
G.UI = {
  vi:{
    brandSub:'Gia Đình Thịnh Vượng',
    search:'Tìm kịch bản, mô thức, phác đồ, màn hình…',
    fiveGroups:'NĂM NHÓM CHÍNH',
    myAccount:'Tài khoản của tôi',
    logout:'Đổi vai / Đăng xuất',
    changePw:'Đổi mật khẩu',
    sync:'Đồng bộ',
    forgot:'Quên mật khẩu?',
    compass:'La bàn văn hoá',
    heroKicker:'Hệ Sinh Thái Gia Đình Thịnh Vượng',
    heroH1a:'Bảy ngày đầu, mình', heroH1b:'chưa sửa gì cả.', heroH1c:'Mình chỉ', heroH1d:'nhìn cho đúng.',
    heroLead:'Anh chị không cần tin điều gì hôm nay. Chỉ cần nhìn thử tấm bản đồ này một lần — và tự thấy nhà mình đang đứng ở khoang nào.\n\nGITA 365 không hứa con sẽ ngoan hơn sau một tháng. GITA 365 làm một việc: sau 365 ngày, nhà mình vận hành được mà không cần ai canh.',
    heroBtn1:'Bước vào bản đồ', heroBtn2:'Xem 15 tài khoản trải nghiệm',
    heroBtn3:'Chưa có tài khoản — xem trước GITA 365 làm gì',
    loginHint:'Chọn một vị trí để xem hệ thống đúng như vị trí đó nhìn thấy. Đổi vai bất cứ lúc nào.',
    orLogin:'HOẶC ĐĂNG NHẬP BẰNG TÀI KHOẢN',
    signUp:'Chưa có tài khoản? Đăng ký',
    gateVisionEyebrow:'TẦM NHÌN GITA 365',
    /* Hai chuỗi tầm nhìn · sứ mệnh KHÔNG viết ở đây. Chúng được gán từ
       G.CULTURE ở cuối tệp này — xem khối "MỘT BẢN GỐC" phía dưới. Để
       chỗ giữ chỗ ở đây cho khối vi vẫn đọc được liền mạch. */
    gateVisionTitle:'',
    gateMission:'',
    gateMapTitle:'BẢN ĐỒ GIA ĐÌNH THỊNH VƯỢNG · NĂM CHẶNG',
    loginHint:'Chưa biết mật khẩu? Mở danh sách để xem đủ mười lăm tài khoản kèm mật khẩu, và bấm Vào là đăng nhập ngay.',
    seePw:'Xem tài khoản và mật khẩu',
    login:'Đăng nhập', pw:'mật khẩu',
    auditorsNote:'Bốn chuyên gia phản biện cũng có tài khoản riêng — xem trong danh sách.',
    tabLaban:'LA BÀN', tabGiatri:'GIÁ TRỊ', tabVanhoa:'VĂN HOÁ', tabNhip:'NHỊP', tabCongdong:'CỘNG ĐỒNG',
    vision:'TẦM NHÌN', mission:'SỨ MỆNH', compassAct:'KIM CHỈ NAM HÀNH ĐỘNG',
    coreValues:'BẢY GIÁ TRỊ CỐT LÕI', houseRules:'NỘI QUY HỆ SINH THÁI',
    fourBeats:'BỐN NHỊP TRONG CUỘC TRÒ CHUYỆN KHÓ', sixLines:'SÁU RANH GIỚI',
    rhythm:'NHỊP SỐNG CỦA HỆ SINH THÁI', creeds:'CÂU GIỮ LỬA',
    forCommunity:'GIÁ TRỊ MANG LẠI CHO CỘNG ĐỒNG', fiveTiers:'NĂM TẦNG MỘT LIẾC',
    openFull:'Mở đầy đủ', langNote:'',
    lock:'Vai hiện tại chưa mở mục này.'
  },
  en:{
    brandSub:'Family Prosperity Ecosystem',
    search:'Search sessions, models, protocols, screens…',
    fiveGroups:'FIVE CORE GROUPS',
    myAccount:'My account',
    logout:'Switch role / Sign out',
    changePw:'Change password',
    sync:'Sync',
    forgot:'Forgot password?',
    compass:'Culture compass',
    heroKicker:'The Family Prosperity Ecosystem',
    heroH1a:'For the first seven days, we', heroH1b:'fix nothing.', heroH1c:'We only', heroH1d:'learn to see clearly.',
    heroLead:'You do not have to believe anything today. Just look at this map once — and see for yourself which chamber your family is standing in.\n\nGITA 365 does not promise a better-behaved child in a month. GITA 365 does one thing: after 365 days, your household runs without anyone standing guard.',
    heroBtn1:'Enter the map', heroBtn2:'See 15 trial accounts',
    heroBtn3:'No account yet — see what GITA 365 does',
    loginHint:'Pick a position to see the system exactly as that position sees it. Switch any time.',
    orLogin:'OR SIGN IN WITH AN ACCOUNT',
    signUp:'No account yet? Sign up',
    gateVisionEyebrow:'GITA 365 VISION',
    gateVisionTitle:'To build an ecosystem of families that grow for the long run — where each person comes to understand themselves, train themselves, take charge of their own life, and together create happiness, success and prosperity across generations.',
    gateMission:'Give every family a map, a rhythm and a companion — so that after 365 days the household runs without anyone standing guard.',
    gateMapTitle:'THE PROSPEROUS FAMILY MAP · FIVE STAGES',
    loginHint:'Don\u2019t know the password? Open the list to see all fifteen accounts with their passwords, and hit Enter to sign in.',
    seePw:'See accounts and passwords',
    login:'Sign in', pw:'password',
    auditorsNote:'The four adversarial reviewers have their own accounts — see the list.',
    tabLaban:'COMPASS', tabGiatri:'VALUES', tabVanhoa:'CULTURE', tabNhip:'RHYTHM', tabCongdong:'COMMUNITY',
    vision:'VISION', mission:'MISSION', compassAct:'GUIDING PRINCIPLES',
    coreValues:'SEVEN CORE VALUES', houseRules:'ECOSYSTEM HOUSE RULES',
    fourBeats:'FOUR BEATS FOR A HARD CONVERSATION', sixLines:'SIX BOUNDARIES',
    rhythm:'THE RHYTHM OF THE ECOSYSTEM', creeds:'LINES THAT KEEP THE FIRE',
    forCommunity:'WHAT THIS GIVES THE COMMUNITY', fiveTiers:'FIVE TIERS AT A GLANCE',
    openFull:'Open in full',
    langNote:'Interface, culture compass, the five tiers and the emotional-touchpoint map are fully localised. The professional library — 1,000 sessions, 220 protocols, 42 training models — remains in Vietnamese, its source language; localisation is scheduled per country launch.',
    lock:'Your current role has not unlocked this section.'
  }
};

/* ══════════ MỘT BẢN GỐC CHO TẦM NHÌN VÀ SỨ MỆNH ══════════
   Trước v7.7 câu tầm nhìn có hai bản khác nhau: một ở G.CULTURE, một
   viết tay trong khối vi ở trên. Cổng đăng nhập và thanh la bàn đọc bản
   này, màn "GITA 365 là gì" đọc bản kia — nên trên cùng một màn hình
   người dùng nhìn thấy hai tầm nhìn khác nhau của cùng một Học viện.

   Nay bản gốc chỉ có một, nằm ở G.CULTURE trong src/data.core.js (nạp
   trước tệp này). Khối 'en' vẫn giữ bản dịch riêng, vì dịch là việc của
   người, không suy ra được từ bản tiếng Việt. */
(function(){
  var C = G.CULTURE;
  if(!C || !G.UI || !G.UI.vi) return;
  if(C.tamNhin && C.tamNhin.big) G.UI.vi.gateVisionTitle = C.tamNhin.big;
  if(C.suMenh  && C.suMenh.big)  G.UI.vi.gateMission     = C.suMenh.big;
})();

/* ══════════ NĂM NHÓM & 42 MỤC ══════════ */
G.NAV_EN = {
  g1:{t:'THE PROSPERITY MAP', s:'Where does our family stand, and what will it become?',
      e:'Where everything starts: see clearly before changing anything.'},
  g2:{t:'THE FIVE-TIER JOURNEY', s:'In what order, so nothing collapses?',
      e:'Seven days to see · 21 days to understand · 90 days to build · 365 days to hand over.'},
  g3:{t:'THE TREASURE VAULT', s:'Which playbook fits this exact situation?',
      e:'1,000 sessions · 220 protocols · 42 models · the full source books — unlocked as you progress.'},
  g4:{t:'THE JOLT & THE RHYTHM', s:'What do we do today so this house changes?',
      e:'Habits, rituals, roles held, and jolts big enough to lift the whole family.'},
  g5:{t:'ECOSYSTEM & OPERATIONS', s:'Who is around us, and how is the system running?',
      e:'A constellation of remarkable families, the guiding team, and the ecosystem control room.'}
};
G.ITEM_EN = {
  'ban-do':['The Family Prosperity Map','5 chambers · 9 roles · 8 baseline duties'],
  'chan-dung-nha':['Portrait of our household','Who each person really is'],
  'dinh-vi':['Where we stand today','An honest scoreboard, not a feeling'],
  'tam-nhin':['Vision 5 – 20 years','Everyone writes; nobody writes for anyone else'],
  'chuyen-hoa':['From pain to longing','Seven shifts that make a different family'],
  'hanh-trinh-con':['Our child’s journey','From "so many problems" to the family’s pride'],
  'diem-cham':['Emotional touchpoint map','Nine moments that decide whether they stay'],
  'lo-trinh':['The path T1 → T5','Five stages, one question each'],
  'gita-map':['The G – I – T – A map','Four domains to read the real cause'],
  'chu-ky':['21 / 90-day cycles','PDCA and the acceptance gate of each stage'],
  'nhiem-vu':['Missions & the 365 journal','Today’s work, written down'],
  'chan-dung-tc':['Ten portraits of success','What the people ahead actually look like'],
  'cong-nghiem-thu':['Acceptance gates','Pass on evidence, never on words'],
  'kho':['The treasure vault','Everything you already have'],
  'phac-do':['220 protocols × 5 tiers','Every problem has a route'],
  'kich-ban':['1,000 professional sessions','Consulting and coaching, all five tiers'],
  'mo-thuc':['42 training models','The founder’s original toolkit'],
  'tu-duy':['A new way of thinking','14 lessons that change the air at home'],
  'sach':['Source books & academy archive','11 chapters · 515 passages · searchable'],
  'ngon-tu':['Language that leads','Six beats · sentences you can use tonight'],
  'thuong-hieu':['GITA 365 brand identity','Mark, colour, type, voice, usage'],
  'tro-ly':['The GITA assistant','Ask anything, answers cite their source'],
  'chin-vai':['Nine roles held at home','Who holds what, and who is left out'],
  'thoi-quen':['Habits & family rituals','Four rituals that hold the year'],
  'cu-hich':['The big jolt','Campaigns that create a leap, not a step'],
  'bang-so':['The family scoreboard','Seven output indicators of the model'],
  'phan-thuong':['Points · Levels · Gifts','Recognition for work actually done'],
  'vinh-danh':['Honour & the year’s feat','Good news at home must be told'],
  'ranh-gioi':['Six boundaries','Things that are never done here'],
  've-tinh':['My constellation','The remarkable people around us'],
  'dai-su':['GITA 365 ambassadors','4 levels · 20 missions · 13 safety rules'],
  'hoa-hong':['Ambassador economics','Four levels · commission capped at 10%'],
  'su-kien':['Events & campfires','Where the whole ecosystem meets'],
  'coach-deck':['The coach’s cockpit','Which family to touch first today'],
  'tuvan-deck':['The opening chamber','Who is searching, and the next step'],
  'nguoi-dan-dat':['The guide’s own journey','Grow, contribute, be recognised'],
  'doi-ngu':['The guiding team','Who keeps the fire for which families'],
  'dieu-hanh':['Control room','Whole-ecosystem health'],
  'nguoi-dung':['People & permissions','Accounts, roles, access levels'],
  'kiem-duyet':['Vault moderation','Professional standard before publishing'],
  'tang-truong':['Finance & growth','Cash that can carry the mission'],
  'hai-long':['Satisfaction & feedback','Target 90% · hear what they really say'],
  'tai-lieu-khach':['Documents families send in','Read their creativity, upgrade their path'],
  'kiem-thu':['The four-expert test lab','Demanding · Informed · Engineer · Wordsmith'],
  'chuan-1000':['The 1000-point standard','Ten groups, detail by detail'],
  'ra-soat':['System audit','Security, code, data integrity, brand'],
  'nhat-ky-ht':['System audit log','Every action leaves a trace'],
  'bat-dau':['Start here','Your first five steps, in order'],
  'wow':['The WOW chain','Seven moments they will not forget'],
  'banh-da':['Ten flywheels','10 loops × 10 actions · 10 levels · milestones open on evidence'],
  'mua-doi':['The season our family is in','A hard season lowers the bar, never penalises · the streak is protected'],
  'buc-tranh':['The journey picture','7 lands · 3 questions each evening · which branch needs watering'],
  'doi-dong-hanh':['The person walking with us','5 promises · caps of 5-10-3 · 20 situations, the right words'],
  'giu-lua':['The day this system is done','5 conditions for done · 3-tier andon · 6 failure playbooks'],
  'tien-rung':['Six things never for sale','Promises on data and money · 4 sources · the order costs get cut'],
  'bien-nien':['Five things no one may change','A one-page constitution · 10 decades · 5 ways a 100-year project dies'],
  'phap-ly':['Your family\u2019s seven rights','Silence · erase · leave · veto · read · correct · complain'],
  'so-tay-tu-van':['Five things a consultant may not do','Red lines at closing · 30 objections, real or fake · 15 monthly numbers'],
  'so-tay-gia-dinh':['The family\u2019s handbook','24 pages · 30 questions · 7 rights · the last page left blank for you'],
  'hansei-sach':['What this system still owes','5 unanswered questions · 3 kinds of automated decision · 9 self-found contradictions'],
  'hanh-trinh-5-tang':['The five-tier road','A Thriving Family · 5 challenges · and the day this ladder runs out of rungs'],
  'sau-vung':['Naming the loop you are stuck in','5 zones · 1 core of self-awareness · 4 named places you fall, and the way back from each'],
  'bang-tin':['You are not walking alone','Community news · 6 criteria for a story to run · every number states where it is counted from'],
  'ban-co':['The journey board','One board per tier · one square a day · pick 1 of 10 · points weighted by what matters now'],
  'ban-coach':['The coach workbench','5 exhaustive lanes · an 8-slot prepared pack · timed reminders · 4 morning sweeps'],
  'ban-tu-van':['The consultant workbench','5 exhaustive lanes · 7 screening questions, 4 of them blocking · a 9-cell intake record · a 6-slot prepared pack'],
  'diem-cham-1000':['1000 wow touchpoints, 1000 retention locks','50 level cells x 10 beats x 2 people · coach required / optional / not needed · the 12 things thirty years teaches you not to do'],
  'ra-soat-phap-ly':['Legal review — 64 findings','8 groups · 20 critical findings each checked against the running function · 2 new statutes · 4 places the document and the app disagree'],
  'bang-chung':['Electronic evidence standard','13 operations x 6 properties · the machine reads the real log and counts · 3 ways evidence loses its value · the 5 nearest fixes'],
  'so-tay-admin':['Super Admin handbook — the left rail from A to Z','Daily/weekly/monthly/quarterly rhythm · the first 7 days · the 12 screens where one wrong click costs most · the full screen list generated from the running app · what one permission actually opens'],
  'tu-dong':['Automation — measured on the running system','34 activities · a ratio measured, not declared · 5 things the machine may never take · 5 next steps ranked by what they unblock'],
  'tin-noi-bo':['Internal team board','5 lanes scoped by role · recognition records the work, it never ranks people · a hard cap of 3 pushes a day · clients and ambassadors cannot read a single line'],
  'ky-ket':['Signing guide — three streams of engagement','Employment · client service · finance · 7 gates before the pen touches paper · a contract decision tree · 8 things never to do'],
  'ho-so-hop-dong':['Contract and operations file set','16 contracts · 25 base clauses · 6 special clauses checked in reverse · a pay formula the machine reads itself · 3 signature tiers'],
  'hanh-lang':['The success corridor — the app auditing itself','12 laws · 18 failure strains with a vaccine each, verified against live code · 9 locks · the Six Beats · 7 health indicators · where the doc and the app disagree'],
  'ra-soat-loi':['System fault review — 66 break points','8 groups · 13 release-blocking faults, each checked against the running function · 4 root causes · 5 waves'],
  'chuan-ngon-ngu':['Language standard for six roles','6 roles · 9 banned sentence patterns, not banned words · a scanner that runs over the real vault · a replacement line for each hit'],
  'pheu-chot':['Conversion funnel - where the 90% actually belongs','5 tiers · who gets screened out where · raw close rate vs qualified close rate · the three numbers to read alongside'],
  'dien-thu':['Dry run — the two hardest sessions','2 cases x 20 turns · every turn traced to a store and a language filter · the easy line the rules forbid'],
  'hoat-dong':['Activity register — which work has no owner','21 activities · 3 automation levels · 4 things the machine may never take · a fall-through path for each'],
  'ban-ve':['The blueprint set — 50 cells, one tag each','4 reading principles · 50 levels · 4 gates · 10 beats · 20 red signals · an upgrade map'],
  'tang5-pro':['The T5-PRO line — Prosperous Family','24 months · 4 phases · a 3-role team · 6 intake criteria · 5 refusal scripts'],
  'so-tay-van-hanh':['Ten rules, and where each one actually holds','Priority order · 10 charter points · 4 things forbidden at scale · 4 places the system breaks'],
  'tang34':['Tier 3 and tier 4 — whose job is which','Assistant/Coach boundary · the 5-beat G-I-T-S-A frame · 3 measures · 14 hard cases'],
  'coach-5-tang':['What the person walking with you must be able to do','5 coach tiers · 4 competencies each · a 10-step cycle · 1000 divided by the caps'],
  'nam-dau':['The first-year handbook','12 months · 6 checkpoints · 8 first-time playbooks'],
  'dao-tao-dh':['Forty hours of training','12 sessions · 20 role-play cases · 1 absolute criterion'],
  'nam-man':['The five-screen console','30 minutes each morning · 3 companion levels · 5 terms'],
  'kien-truc-100':['The hundred-year architecture','100 value layers · 5 eras · +3–5% a year'],
  'ban-do-chien-luoc':['Strategy map','4 layers · 18 objectives · a testable chain of cause and effect'],
  'the-diem-can-bang':['Balanced scorecard','One measure per objective · 7 review rhythms'],
  'tinh-gon':['Lean process','7 kinds of waste · 10 principles that cut real cost'],
  'giai-doan-bao-ve':['Stages and layers of defence','5 stages · 4 layers, including what is still missing'],
  'cai-tien':['Improvements from the people doing the work','Name what is stuck · someone must answer within 14 days'],
  'chuan-nhat':['Operating standard','Kaizen · Monozukuri · Omotenashi · Shokunin'],
  'ai-dieu-phoi':['AI orchestration','Tier limits · KPI routing · capability review'],
  'an-toan-du-lieu':['The data shield','Anti-copy · anti-impersonation'],
  'hoc-tu-lon':['Learning from the giants','TikTok · Google · Toyota · Apple…'],
  'chi-phi':['Cost architecture','Under 500k VND a month · heavy work on-device'],
  'tang-quyen':['Access tiers','15 roles × 21 permissions'],
  'vong-doi-tk':['Account lifecycle','KPI · lock · reinstate · reset'],
  'hang-tai-lieu':['Document ranking 1–100','KPI and rank unlock better material'],
  'dau-mat':['Hidden document marks','Five layers · trace any leak'],
  'dong-chay':['Information flows','The seven flows that feed the ecosystem'],
  'tinh-huong':['250 field situations','Key code · 7-day challenge · KPI'],
  'kho-qua':['1,000 gift documents','Stuck somewhere? Open exactly that one'],
  'ket-noi':['Ecosystem links','Sync · Facebook · Telegram'],
  'bando-tuvan':['Customer operating map','Seven stages · learn it in four weeks'],
  'phuong-phap':['Method backbone','42 GITA patterns · 6 language beats'],
  'van-tay':['Fingerprint biometrics','GITA\u2019s settled position'],
  'chuyen-doi':['Nine conversion gates','Stranger → ambassador → partner'],
  'hoso-vip':['VIP & VVIP profile standard','7 sections · 30 fields · thirty seconds'],
  'ai-cham':['Automated care assistant','16 background rules · clear limits'],
  'ma-tran':['220-problem matrix × 5 tiers','11 groups · 8 deep columns per tier'],
  'ma-tran-bang':['Matrix × 4 customer bands','GREEN · AMBER · ORANGE · RED within each tier'],
  'tham-gia':['The way in — six steps','Intro → sign up → assessment → profile → direction → 7-day challenge'],
  'hoc-phi':['Tuition across five tiers','18 money scripts · 7 rules · collection and refund'],
  'soat-day-du':['Completeness self-audit','5 checks · counted live from loaded data'],
  'tuyen':['Four subject tracks','Engwin · Math · SAT · HSA · seven gates before the merge'],
  'quy-trinh-toan-he':['Whole-app process map','8 flows · one screen per step · what admin alone can do'],
  'kiem-theo-vai':['Test by role','Screen × role matrix · switch into any role in one click'],
  'tu-van-hanh':['Self-running · self-patching · self-learning','4 automation levels · 10 watches · scanned live on open'],
  /* Ba mươi tư mục dưới đây trước nay chỉ có tiếng Việt: bản tiếng Anh
     rơi vào ô trống nên giao diện EN hiện mã màn hình thay cho tên. */
  'gioi-thieu':['What GITA 365 is','Mission · vision · goals · values · five tiers · culture · how we stay with you'],
  'toi':['Account and role switching','The role in use · level · portal · permissions held and out of scope · switch roles quickly for testing'],
  'pham-vi':['My scope','How far my access goes · what is still closed'],
  'danh-gia':['Rate GITA 365','Three questions · the "what went wrong" part matters most'],
  'duyet-danh-gia':['Approve public reviews','Four gates before a family\u2019s words go public'],
  'ban-do-ca-nhan':['Personal blueprint · 11 blocks','Why → talent, then loop back and revise the path'],
  'vong-nhac':['Right – Enough – Deep loop','Reading is not doing · three rungs per task'],
  'hanh-trinh-12':['The learner journey · 12 stages','4 pillars · who owns each · WOW touchpoints'],
  'luat-lam-viec':['Rules for working with families','Everything through the system · breach costs 50% of KPI for 3 months'],
  'ref-gita':['One family refers one family','Referrer profiles · 30s-60s-8p · 16 steps'],
  'khach-lon':['Serving major clients','4 tiers · touch cadence · the 68-point file'],
  'kho-tong':['The whole vault at a glance','9 groups · 50+ stores · real counts'],
  'thu-vien':['Document library','Upload documents · this is how the vault grows'],
  'minh-chung':['Task evidence','Submit photos and reports confirming the work was done'],
  'tai-lieu-goc':['Academy source documents','5 sets · 161 tables · 1,647 data rows'],
  'nhan-dien-loi':['Voice and wording guide','How GITA speaks · 10 signs of machine-written prose'],
  'so-tay-nhan-dien':['GITA identity handbook','7 written chapters · read here, no download'],
  'chieu-sau':['Five layers of depth','One model, five practice levels, five different things you can do'],
  'nhan-dien':['GITA brand identity','Logo · three colours · type · usage rules'],
  'van-dung':['Five levels of application','Depth of craft · tier limits · reporting'],
  'xu-ly-ca':['Case handling process','7 steps · evidence required · 4 constraints'],
  'gui-tu-lieu':['Send material to a family','Pending requests · the 80% KPI gate'],
  'chuyen-cam-hung':['Inspiring stories','100 stories for your level · 10 threads · one story per mission'],
  'chuyen-the-gioi':['Real people, real work','Entrepreneurs · scientists · artists · athletes · Vietnamese figures'],
  'giong-doc':['Read or listen · narration','Voice licensing · studio standard · narration script'],
  'nhat-ky-vi-tri':['My journal','Daily · weekly · monthly · fields specific to each position'],
  'thi-viet':['Writing contest · 7 – 21 – 90 – 365','Entries passing day 90 and 365 earn a 10% scholarship'],
  'sat-hach':['Competency assessment','5 tiers · 4 graduation papers · 8 assessment axes'],
  'khoa-dao-tao':['My training course','Learn · Do · Submit · the next lesson opens itself'],
  'do-thoi-gian':['Time · rewards · penalties','A real clock · three thresholds · completion standard · point conversion'],
  'noi-may-chu':['Connect to the server','Paste the address · test the call · six setup steps'],
  'bo-nao':['GITA 365 Brain','13-article constitution · three delegation zones · 10-point fence · anonymise before anything leaves · seven advisory seats'],
  'vung-manh':['Your Child\'s Strong Zone','three observable behaviours · seven fields · four weeks · Strength Card valid 90 days · five-tier value ladder'],
  'coach-kh':['Customer Coaching','nine-step loop · twelve question streams, four require three council rounds · five seats, the soul-keeper must be a real person · Crawling-Baby ceilings'],
  'noi-dung-tiep-thi':['Content & Marketing','seven awareness tiers — content without a declared tier cannot be published · one source, seven branches · seven-item ad filter, four machine-checked and three human-attested'],
  'van-hanh-cham-soc':['Operations & Care','23-field family twin profile · three-colour signal computed at read · 365-day care rhythm with the day 8-12 death zone · five-column trace log; a red light must be a phone call'],
  'tai-chinh-ceo':['Seven CEO Numbers','the seven weekly numbers split into THREE panes by source · runway computed on the Academy own funds, not gross cash · four finance laws · three scenarios written in advance'],
  'con-nguoi':['People · Three Gates','the three gates a new team member passes — 13/13 on the Constitution · voice scored by the 10-point guardrail · three real calls with a mentor. Until all three are cleared, nobody touches a customer alone, and the gate sits where a touch is logged, not on a screen'],
  'phap-ly-rui-ro':['Legal & Risk','two laws in force from 2026-01-01 — the seven Law 91 duties split by WHO does them · three separate consent boxes, the child-data one signed by a PARENT · a delete request that actually runs, split into the measured half and the attested half · four questions to take to a lawyer, with no answers attached'],
  'he-dieu-hanh':['Executive OS','GITA-CEO-OS v3.0 — four operating rhythms, each with a stated duration · a 12-metric dashboard split by source, nine measured doors and three human-entered cells · a five-step decision process pinned to two timestamps · five growth stages with no leapfrogging · four standing commands, the fourth of which is the real test'],
  'bo-prompt':['Prompt Pack · 4 Roles','four paste-ready prompts A, B, C and D — ASSEMBLED AT RUNTIME from the vaults, with not one line of them stored anywhere · role C must run on a DIFFERENT provider from role A, so the author never reviews itself · six steps for anything published, the last two performed by a person · wired into seven doors that already run'],
  'bang-gia':['Price Table','numbers editable on the spot, the frame stays in the vault — prices are provisional while the system is being built, so they must be changeable, while what a tier PROMISES to deliver still ships through a release · every change is a NEW ROW with a signer and a reason · a price already frozen into a family payment schedule never moves · changing a price never shifts the spend-approval ladder by itself'],
  'luat-giao-dien':['Interface Laws','twelve veto rules born out of the thirty-part course — the teeth live on the SERVER, not in the interface, because the interface is the most-rewritten part of any codebase · seven laws have real gates today; five describe screens not yet built and are guarded by measuring that the door does NOT YET EXIST · no ranking families · no demotion · red-circle data never leaves the device · the machine never drafts an apology'],
  'ngoi-nha':['Prosperity Home','Tap each part of the house to open what belongs there — build a thriving family'],
  'con-duong':['Mission Road','Walk your family down the ten flywheels — a guide leads, each mission appears as you reach it'],
  'nhan-vat':['My Character','Build your own avatar on this device — your photo never leaves it — then take it onto the Mission Road'],
  'hom-nay':['Today','one single task for tonight — tick it and put the phone down; two equal tasks at nine in the evening, in the kitchen, hands busy, means neither gets done · Storm Mode is one tap and NEVER asks why · skipping a task is never interrogated · heavy items carry a Some other day button beside continue, at the SAME SIZE'],
  'tu-nang-cap':['Self-Upgrade Loop','A system that can rewrite its own upgrade path has no limits at all — so the seven no-touch zones are built BEFORE the five-gate loop · touching them is NOT "needs higher approval", because every ladder can be climbed · the MACHINE assigns the work tier, never the proposer — let people tier their own work and everything is Tier 1 · the sandbox gate compares TWO REAL TIMESTAMPS instead of reading a checkbox · the rollback path must be TESTED, not merely written'],
  'supreme':['GITA Supreme · Map','Map of the owner\'s three research volumes and their CEILING — the first tab is the NAMING TRAP: three different scales all called touchpoints (1,000 progress · 9 emotional · 100,000 system), and a broken rule gets argued about while two scales sharing a name never do — they are simply read as one · four NEW conflicts, not a second copy of the six existing prohibitions · two places my own scan raised FALSE POSITIVES because the document was criticising the very thing being scanned for · 28-capability matrix · ten touchpoint layers · 45 of 100 parts actually written'],
  'giam-sat':['Monitoring Ceiling','GITA-VIP builds the CEILING first and no monitor yet — a gate built after a door is already running is only a reminder · six ABSOLUTE PROHIBITIONS no order can lift, not even a signed R01 order · three scopes that differ by LEGAL BASIS, not by degree · every authorisation must carry an expiry and revokes itself · hash-chained ledger where editing one row breaks every row after it'],
  'bien-soan-noi-dung':['Content Editor','24-block template · machine measures · five approval gates · content constitution'],
  'studio':['GITA Studio — Video Workshop','Script from the sentence bank · 1080p canvas · real human voice · inspection lights · video passport'],
  'quyen-nang-ai':['AI Powers — Granted by Super Admin','Super Admin turns ten AI work capabilities on/off · each OFF by default · acting capabilities route through the existing three-level approval chain · read-only ones surface, never conclude'],
  'dieu-phoi':['AI Orchestration — 100 Super-Agents','The GITA365 genius brain sits highest and orchestrates all · 100 super-agents each own one real door, one ownership key each so they never conflict · every agent passes the real gates (Article 13 · AI grant · three signatures), pointing not copying · self-improvement runs through the gated upgrade ring · ×100 is a direction, not a target'],
  'thanh-tra-soi':['Ten Inspection Squads','Ten INDEPENDENT inspectors that hunt weak spots so the system performs at its best, ten LEVELS × 100 tiers = 1000 contiguous standard tiers · each squad ANCHORS to a real check in the source (soatRaNgoai · truyHoiHe · capDuyetTheoTien · nhaCuaMinh · xuatDuLieuNha · danhDauXoa · dieuPhoiTroLy · a11yNhan · lapTheVungManh · kiemPhien), not a slogan — measure 114 verifies each name exists in its file, a fake name turns it red · higher level = heavier consequence on failure, level 10 is a child data leak out of the system'],
  'tu-hoan-thien':['Self-Completion Loop — Gated Vault Fill','When a vault is empty mid-advising the Brain DRAFTS from existing data, never fabricates — but promoting to the live vault needs Product → CEO → Super Admin · machine drafts, does not promote · whether three signatures are in is COMPUTED AT READ from the ledger, no "approved" column · three levels, three different people · the delay is real and stated plainly to the customer'],
  'kien-truc-thi-giac':['Visual Architect','Read a screen · document · proposal · library · visual constitution · brand decisions'],
  'phong-tai-chinh':['Finance & Accounting Office','Notice board · assistant · my queue · daily book · bank reconciliation · weekly close · KPI · payroll · charter'],
  'phan-quyen':['Assignments & permissions','15 positions × 31 permissions · click a cell to change it'],
  'cap-tai-khoan':['Open a new account','Issued for positions from Consultant upward'],
  'khoa-tai-khoan':['Lock · reopen · delete','The life of an account, with a stated reason'],
  'sap-xep':['Rearrange the menu','Reorder · hide · add a new folder'],
  'sua-hien-thi':['Edit displayed text','Any wording that reads wrong, fix it here'],
  'duyet-tai-lieu':['Review submitted documents','View · score against the standard · approve or return'],
  'theo-doi-tai-nguyen':['Resource monitoring','Alerts when one account touches more than 20% of the vault'],
  'referral':['Referral trigger sheet','5 portraits · 12 signals · PAIN GOAL GAP'],
  'chan-dung-kh':['Six customer portraits','Read the family right, send the right path'],
  'do-luong-kh':['Customer measurement system','7 metrics · 6 cadences · improvement loop'],
  'hang-vip':['VIP & VVIP tiers','4 tiers · service standards · AI care'],
  'cay-tien':['Money tree — VIP care','4 moves · money-tree score · 12 cadences'],
  'nhan-su-tt':['Loyal staff profile','5 levels · 7 metrics · 5 rules'],
  'tien-bo':['What changed at home','This week next to last week, with the gap explained'],
  'bang-viec':['My work board','Overdue · in progress · new · done · close the day'],
  'danh-muc-viec':['Task catalogue','Tick to take a task · each says what evidence closes it'],
  'kpi-toi':['My KPI','Daily · monthly · shared responsibility · pay band'],
  'bo-test':['Five-tier assessment set','25 sets · 750 questions · four customer bands'],
  'kpi-100':['Ten milestones to the finish','10 milestones · 100 measurable criteria'],
  'bando-coach':['Coaching map','Six beats a session · six ways to sharpen it'],
  'van-ban':['Standard documents','22 templates across five kinds of work'],
  'tai-chinh-qt':['Financial governance','6 principles · 5 ledgers · 6 controls'],
  'thanh-tra':['Inspection & alerts','6 cycles · 10 time-bound alerts'],
  'ra-soat-kh':['The twelve-face review','Never miss what a family needs'],
  'xuat-du-lieu':['Data export','PDF records · CSV lists · permissions'],
  'quy-trinh-tc':['Financial processes','Payment · refund · performance pay'],
  'dong-hanh':['Your companion','The advisor who always listens']
};

/* ══════════ NĂM TẦNG ══════════ */
G.TIER_EN = {
  T1:{name:'RECOGNISE', q:'What is actually going on?',
      feel:'The first time the whole family looks at one truth without arguing.'},
  T2:{name:'DECODE', q:'Why does it keep happening?', feel:'Blame stops. Mechanism begins.'},
  T3:{name:'BUILD', q:'What must we do, and how?',
      feel:'This house has a system that runs — one we built ourselves.'},
  T4:{name:'TRANSFORM', q:'How does change become capability?',
      feel:'The steering of learning is now in the child’s hands.'},
  T5:{name:'BREAK THROUGH', q:'How far can this family go?',
      feel:'A household that runs without anyone standing guard.'}
};

/* ══════════ LA BÀN VĂN HOÁ — BẢN TIẾNG ANH ══════════ */
G.CULTURE_EN = {
  slogan:'A household that runs — without anyone standing guard.',
  sloganSub:'GITA 365 · The Family Prosperity Ecosystem',
  tamNhin:{big:'By 2030, one million Vietnamese grow up inside a household that runs itself — where the child steers their own life and the adults are still growing too.',
    sub:'Not a million better-behaved children. A million different families.'},
  suMenh:{big:'Give every family a map, a rhythm and a companion — so that after 365 days the household runs without anyone standing guard.',
    sub:'We bring the frame and hold the standard. The family assembles its own part.'},
  kimChiNam:[
    {n:'01',t:'See clearly before fixing',d:'The first seven days cure nothing. Without data, every solution is a well-meant guess.'},
    {n:'02',t:'Intervene at the right layer',d:'Nagging about waking early works on Behaviour. If the knot sits in Belief, no amount of nagging moves it.'},
    {n:'03',t:'Change the lens, not the volume',d:'If three rounds of data did not land, a fourth will not either. Let them stand somewhere else and look.'},
    {n:'04',t:'Never assemble it for them',d:'A family only stays with a path it helped build. Doing it for them takes away the thing that carries them through the year.'},
    {n:'05',t:'Anchor only on real evidence',d:'Every acknowledgement starts from something that happened, not from encouragement. An anchor on fiction breaks at the first stumble.'},
    {n:'06',t:'The adults change first',d:'The parents’ own change must be presentable at the year-end family conference. Without it, the child’s stage stands on sand.'}
  ],
  giaTri:[
    {k:'TRUTH',c:'#2A72C6',t:'Honest with the data',d:'Speak in numbers with a date, a time, a count. An off day is a data point, never a verdict.',nen:'Record even the worst night.',khong:'Prettify a report so it reads well.'},
    {k:'CARE',c:'#BE0E16',t:'Unconditional respect',d:'No labels, no rankings, no comparing one child to another. Each person is measured only against their own last stage.',nen:'Listen seven, advise three.',khong:'Use data to prove someone wrong.'},
    {k:'STANDARD',c:'#2A72C6',t:'Hold the professional standard',d:'Every session has a script, a protocol, an acceptance gate. Improvisation is a risk borne by someone else’s family.',nen:'Open the right script for the right tier.',khong:'Improvise off-standard because it feels familiar.'},
    {k:'ENDURANCE',c:'#0B7350',t:'Rhythm over intensity',d:'21 days makes a level, 90 days makes a stage. A week of blazing then nothing builds no capability.',nen:'Keep the appointment even when it is short.',khong:'Cram a month into one session.'},
    {k:'CLARITY',c:'#5140B4',t:'Transparent to the end',d:'Who holds which role, who can see which data, where the money goes — said plainly up front and written down.',nen:'Say the inconvenient part first.',khong:'Let a family guess about rights and costs.'},
    {k:'HANDOVER',c:'#0B6675',t:'Authority with responsibility',d:'Every right handed over comes with a matching responsibility. Support decreases — but never to zero.',nen:'Let the child decide what the child can carry.',khong:'Drop all support and call it independence.'},
    {k:'PROSPERITY',c:'#F61824',t:'Prosperity means everyone grows',d:'The goal is not one child’s achievement. It is a family system in which every member is still growing.',nen:'Measure the adults’ change too.',khong:'Use the child’s grades as the family’s measure.'}
  ],
  noiQuy:[
    {t:'On time is respect',d:'Show up on the rhythm you committed to. If you cannot, say so beforehand — never go silent.'},
    {t:'Listen before advising',d:'Keep the seven-listen three-advise ratio in every session and every comment in the group.'},
    {t:'Speak with evidence',d:'Share results with data attached. Do not infer causation before the data supports it.'},
    {t:'Label no one',d:'Describe behaviour and context. Never describe a person with an adjective.'},
    {t:'Never rank families',d:'A household’s numbers are compared only with that household’s previous stage.'},
    {t:'What is said here stays here',d:'Everything heard in a shared session stays in that session.'},
    {t:'Tell the part where you stumbled',d:'Sharing only successes makes a newcomer feel abnormal.'},
    {t:'No selling inside learning spaces',d:'No products, services or investment offers inside the companion space.'},
    {t:'Never use technique to push',d:'Reading someone’s state is to understand and support — never to push them into a purchase.'},
    {t:'Correct mistakes in the open',d:'If you posted or said something wrong, correct it where you said it. Never quietly delete.'}
  ],
  bonNhip:[
    {t:'LISTEN',d:'Hear the sentence out. No interrupting, no composing your reply while they speak.'},
    {t:'ACKNOWLEDGE',d:'Name one thing they did or tried, before saying anything else.'},
    {t:'CLARIFY',d:'Ask to understand, not to trap. One open question, then wait three full seconds.'},
    {t:'GUIDE',d:'Offer one small step doable today, plus how they will know they did it.'}
  ],
  choCongDong:[
    {n:'A map instead of scattered advice',d:'Families stop stitching fragments from a hundred contradictory sources.'},
    {n:'One shared language at home',d:'The whole household speaks in chambers, roles, stages, gates, evidence.'},
    {n:'Data instead of argument',d:'Dinner stops being a courtroom. With a scoreboard, nobody has to guess.'},
    {n:'A generation that can steer',d:'Authority over learning sits with the learner by the end of stage four.'},
    {n:'Somewhere for adults to grow',d:'Parents are not treated as the guilty party, but as people learning a difficult craft.'},
    {n:'A community safe enough for the truth',d:'Where telling your stumble is not judged, and telling your win is not envied.'}
  ],
  nhip:[
    {k:'EVERY DAY',t:'One check-in, three lines of journal',c:'#2A72C6'},
    {k:'EVERY WEEK',t:'One full-house sitting: LISTEN – ACKNOWLEDGE – CLARIFY – GUIDE',c:'#5140B4'},
    {k:'EVERY 21 DAYS',t:'One learning level · review the lever in use',c:'#0B6675'},
    {k:'EVERY 90 DAYS',t:'One stage · one acceptance gate backed by evidence',c:'#0B7350'},
    {k:'EVERY 365 DAYS',t:'Family conference · the year’s feat · a new vision board',c:'#BE0E16'}
  ],
  camNiem:[
    {t:'We compare our house to no one. Only to our house yesterday.',by:'Boundary 1'},
    {t:'In the first seven days we fix nothing. We only learn to see.',by:'Tier 1 · Recognise'},
    {t:'A child does not need one more manager. They need a companion who knows the way.',by:'Guiding principle 04'},
    {t:'Any task that cannot be traced back to the 5–20 year vision gets dropped.',by:'Baseline · Direction'},
    {t:'Shut every door and the child cannot grow.',by:'Role 01 · The gatekeeper'},
    {t:'Acknowledgement without evidence is just a pleasant remark.',by:'Baseline · Honour'},
    {t:'A family excludes no one. Someone not yet holding their role needs support, not replacement.',by:'Boundary 3'}
  ]
};
G.cul = function(){ return G.LANG==='en' ? G.CULTURE_EN : G.CULTURE; };
