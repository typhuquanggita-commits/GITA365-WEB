/* ═══════════════════════════════════════════════════════════════
   GITA 365 — MÀN BỘ PROMPT  (GITA-PROMPT-PACK-v3.0)

   ══ MÀN NÀY DỰNG PROMPT, NÓ KHÔNG GIỮ PROMPT ══

   Không một chữ nào của bốn prompt nằm trong kho, và cũng không nằm
   trong tệp này. `G.bpDung(vai)` ghép chúng LÚC CHẠY từ chính các kho
   đã mở — Hiến pháp từ `BN_HIENPHAP`, hàng rào từ `BN_RAO10`, mười
   hai luồng từ `CK_LUONG12`, và tiếp.

   Vì sao phải thế, nói bằng chỗ hỏng: prompt CHÍNH LÀ thứ nói chuyện
   với khách. Chép sẵn một bản rồi sửa Điều 3 ở màn Bộ não thì trợ lý
   vẫn gọi đứa trẻ là "bé" suốt sáu tháng — trong khi mọi bộ kiểm đều
   xanh và màn hình vẫn hiện luật mới. Không có bản thứ hai nào trong
   kho này đắt bằng bản thứ hai ấy.

   Kéo theo: màn này KHÔNG có nút lưu. Lưu ra một bản là tạo đúng cái
   bản thứ hai vừa nói. Dựng lại mất hai giây, và luôn là bản mới nhất.

   ══ BỐN NGĂN ══

     bốn vai  — A · B · C · D, và vì sao C phải ở nhà cung cấp khác A
     dựng     — chọn vai, xem prompt vừa ghép, và dàn bài của nó
     vòng     — sáu bước của một nội dung công khai
     nối      — bốn vai gắn vào cửa nào đã có
   ═══════════════════════════════════════════════════════════════ */
'use strict';
var G = window.G || {}; window.G = G;
G.VIEWS = G.VIEWS || {};

(function () {
  var U = G.U, h = U.h, ic = U.ic;

  var NGAN = [
    {ma: 'vai',  ten: 'Bốn vai',  ic: 'users'},
    {ma: 'dung', ten: 'Dựng prompt', ic: 'quote'},
    {ma: 'vong', ten: 'Vòng chạy', ic: 'clock'},
    {ma: 'noi',  ten: 'Nối vào cửa', ic: 'compass'}
  ];

  G.bpNgan = G.bpNgan || 'vai';
  G.bpVai = G.bpVai || 'A';

  function veLai() {
    if (!G.S || G.S.view !== 'bo-prompt') return;
    if (typeof document === 'undefined' || !document.getElementById('main')) return;
    G.render && G.render();
  }
  G.bpMoNgan = function (ma) { G.bpNgan = ma; veLai(); };
  G.bpChonVai = function (ma) { G.bpVai = ma; G.bpNgan = 'dung'; veLai(); };

  /* ═══════════ BỘ DỰNG ═══════════

     Mỗi kho có một hình riêng, nên bảng dưới đây là chỗ DUY NHẤT biết
     hình của từng kho. Tên kho thì KHÔNG nằm ở đây — nó đọc từ
     `G.BP_KHOI[].layTuKho`, để đổi nguồn của một khối là sửa đúng một
     chỗ trong kho chứ không phải sửa mã. */
  function dong(x) { return String(x === undefined ? '' : x); }

  var DOC = {
    BN_HIENPHAP: function (ds) {
      return ds.map(function (d) {
        return dong(d.so) + '  ' + dong(d.ten) + ' — ' + dong(d.luat);
      });
    },
    BN_RAO10: function (ds) {
      return ds.map(function (d) {
        return dong(d.so) + ' ' + dong(d.hoi) + ' → ' + dong(d.lam);
      });
    },
    CK_LUONG12: function (ds) {
      return ds.map(function (d) { return dong(d.ma) + ' ' + dong(d.ten); });
    },
    CK_MUC5: function (ds) {
      return ds.map(function (d) {
        return dong(d.ma) + ' ' + dong(d.ten) + (d.macDinh ? ' — MẶC ĐỊNH' : '') +
          ': ' + dong(d.cho);
      });
    },
    CK_CUA3: function (ds) {
      return ds.map(function (d) { return dong(d.ten) + ' → ' + dong(d.doi); });
    },
    VM_TRUONG: function (ds) {
      return ds.map(function (d) {
        return '(' + dong(d.so) + ') ' + dong(d.ten) + ' — ' + dong(d.hoi);
      });
    },
    BN_VUNG: function (ds) {
      return ds.map(function (d) {
        return dong(d.ma) + ' (' + dong(d.phan) + '%) — ' + dong(d.ten);
      });
    },
    BN_GHE: function (ds) {
      return ds.map(function (d) {
        return dong(d.so) + ' ' + dong(d.vai) + ' — "' + dong(d.hoi) + '" → ' +
          dong(d.ra) + (d.phuQuyet ? '  [PHỦ QUYẾT]' : '');
      });
    },
    HDH_QUYET5: function (ds) {
      return ds.map(function (d) {
        return dong(d.ma) + ' ' + dong(d.ten) + ' — ' + dong(d.lam);
      });
    },
    HDH_LENH4: function (ds) {
      return ds.map(function (d) { return '"' + dong(d.lenh) + '" → ' + dong(d.ra); });
    },
    PLR_LUAT: function (ds) {
      return ds.map(function (d) {
        return dong(d.so) + ' — ' + dong(d.ten) + ', hiệu lực ' + dong(d.hieuLuc);
      });
    },
    NT_LOC7: function (ds) {
      return ds.map(function (d) { return dong(d.ma) + ' ' + dong(d.hoi); });
    }
  };

  /* Kho hình OBJECT thì đọc giá trị của từng khoá. Không khai riêng
     từng khoá: thêm một khoá ở bản sau thì prompt tự có, còn khai
     riêng thì quên một khoá là chỗ thứ hai của một sự thật. */
  function docObject(o) {
    return Object.keys(o || {}).map(function (k) { return dong(o[k]); });
  }
  /* Kho chưa có bộ đọc riêng thì đọc mềm: lấy ô `ten` nếu có. */
  function docMem(ds) {
    return (ds || []).map(function (d) {
      if (typeof d === 'string') return d;
      return dong(d.ten || d.t || d.ma || JSON.stringify(d));
    });
  }

  /* Dựng một khối. Trả về `undefined` khi kho rỗng hoặc chưa mở —
     KHÔNG trả về một khối rỗng có tiêu đề: một tiêu đề không có dòng
     nào đọc ra là "phần này không có gì", chứ không đọc ra là "kho
     chưa mở", và hai câu ấy khác hẳn nhau. */
  G.bpKhoi = function (ma) {
    var k = (G.BP_KHOI || []).filter(function (x) { return x.ma === ma; })[0];
    if (!k) return undefined;
    var kho = G[k.layTuKho];
    if (!kho) return undefined;
    var ds = Array.isArray(kho)
      ? (DOC[k.layTuKho] ? DOC[k.layTuKho](kho) : docMem(kho))
      : docObject(kho);
    if (!ds.length) return undefined;
    return {ma: k.ma, ten: k.ten, kho: k.layTuKho, dong: ds};
  };

  G.bpDung = function (vai) {
    var v = (G.BP_VAI4 || []).filter(function (x) { return x.ma === vai; })[0];
    if (!v) return {loi: 'Vai không có: ' + vai};

    var can = (G.BP_KHOI || []).filter(function (k) {
      return (k.dungCho || []).indexOf(vai) >= 0;
    });
    var co = [], thieu = [];
    can.forEach(function (k) {
      var kh = G.bpKhoi(k.ma);
      if (kh) co.push(kh); else thieu.push(k.ma + ' (' + k.layTuKho + ')');
    });

    var t = 'BẠN LÀ: ' + v.ten + ' của Học viện GITA.\n' +
      'DÙNG KHI: ' + v.dungKhi + '\n' +
      'ĐẶT Ở: ' + v.danODau + '\n' +
      'NHIỆT ĐỘ: ' + v.nhietDo +
      (v.nhaCungCapKhacA ? '  ·  NHÀ CUNG CẤP PHẢI KHÁC VAI A' : '') + '\n\n' +
      v.y + '\n';

    co.forEach(function (k) {
      t += '\n═══ ' + k.ten.toUpperCase() + ' ═══\n' + k.dong.join('\n') + '\n';
    });

    return {
      vai: v.ma, ten: v.ten, nhietDo: v.nhietDo,
      chu: t,
      khoi: co.map(function (k) { return k.ma; }),
      kho: co.map(function (k) { return k.kho; }),
      /* Khối thiếu được NÊU RA, không bỏ lặng lẽ. Một prompt thiếu
         Hiến pháp trông y hệt một prompt đủ. */
      thieu: thieu.length ? thieu : undefined,
      soChu: t.length
    };
  };

  /* Modelfile cũng dựng lúc chạy — một tệp cũ nằm trên máy ai đó là
     một bản Hiến pháp cũ đang chạy mà không ai biết. */
  G.bpModelfile = function () {
    var a = G.bpDung('A');
    var o = G.BP_OFFLINE || {};
    return 'FROM ' + String(o.nen || '').split(',')[0].trim() + '\n' +
      'PARAMETER temperature ' + a.nhietDo + '\n' +
      'SYSTEM """' + a.chu + '"""\n';
  };

  function thanhNgan() {
    return '<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:18px">' +
      NGAN.map(function (n) {
        var on = G.bpNgan === n.ma;
        return '<button class="btn' + (on ? ' primary' : '') + '" ' +
          'onclick="G.bpMoNgan(\'' + n.ma + '\')" style="gap:7px">' +
          ic(n.ic) + h(n.ten) + '</button>';
      }).join('') + '</div>';
  }

  /* ═══════════ NGĂN 1 · BỐN VAI ═══════════ */
  function nganVai() {
    var l = G.BP_VAI_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.khongDanChung || '') + '</b>' +
      '<p class="sm mt">' + h(l.soanKhacDuyet || '') + '</p>' +
      '<p class="sm mt">' + h(l.nhietDoThapChoSoi || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.batBuocOffline || '') + '</p></div>';

    o += (G.BP_VAI4 || []).map(function (v) {
      return '<div class="card mt" style="border-left:3px solid ' + h(v.c) + '">' +
        '<b>' + h(v.ma) + ' — ' + h(v.ten) + '</b>' +
        '<p class="sm mt"><b>Dùng khi:</b> ' + h(v.dungKhi) + '</p>' +
        '<p class="sm mt"><b>Đặt ở:</b> ' + h(v.danODau) + '</p>' +
        '<p class="sm mt"><b>Nhiệt độ:</b> ' + h(String(v.nhietDo)) +
        (v.nhaCungCapKhacA
          ? ' · <span style="color:var(--bad)">nhà cung cấp phải KHÁC vai A</span>'
          : '') + '</p>' +
        '<p class="sm muted mt">' + h(v.y) + '</p>' +
        '<button class="btn mt" onclick="G.bpChonVai(\'' + h(v.ma) + '\')">' +
        'Dựng prompt ' + h(v.ma) + '</button></div>';
    }).join('');
    return o;
  }

  /* ═══════════ NGĂN 2 · DỰNG ═══════════ */
  function nganDung() {
    var l = G.BP_KHOI_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>' + h(l.dungLucChay || '') + '</b>' +
      '<p class="sm mt">' + h(l.viNguyHonMoiBanChepKhac || '') + '</p>' +
      '<p class="sm mt">' + h(l.khoiTroVaoKhoThat || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.khongCoNutLuu || '') + '</p></div>';

    o += '<div class="row mt" style="gap:8px;flex-wrap:wrap">' +
      (G.BP_VAI4 || []).map(function (v) {
        return '<button class="btn' + (G.bpVai === v.ma ? ' primary' : '') + '" ' +
          'onclick="G.bpChonVai(\'' + h(v.ma) + '\')">' + h(v.ma) + '</button>';
      }).join('') + '</div>';

    var d = G.bpDung(G.bpVai);
    if (d.loi) return o + '<div class="card mt"><p class="sm">' + h(d.loi) + '</p></div>';

    o += U.sec('Dàn bài của prompt ' + d.vai,
      d.khoi.length + ' khối, mỗi khối lấy từ một kho');
    o += U.tbl(['Khối', 'Tên', 'Lấy từ kho'],
      d.khoi.map(function (m, i) {
        var k = (G.BP_KHOI || []).filter(function (x) { return x.ma === m; })[0] || {};
        return ['<b class="sm">' + h(m) + '</b>',
          '<span class="sm">' + h(k.ten || '') + '</span>',
          '<code class="sm">' + h(d.kho[i]) + '</code>'];
      }));

    if (d.thieu) o += '<div class="card mt" style="border-left:3px solid var(--bad)">' +
      '<b class="sm">Khối chưa dựng được: ' + h(d.thieu.join(' · ')) + '</b>' +
      '<p class="sm mt">Kho ấy chưa mở hoặc đang rỗng. Nêu ra chứ không bỏ lặng lẽ — ' +
      'một prompt thiếu Hiến pháp trông y hệt một prompt đủ.</p></div>';

    o += U.sec('Prompt ' + d.vai + ' vừa dựng',
      d.soChu + ' ký tự · nhiệt độ ' + d.nhietDo +
      ' · không có nút lưu, dựng lại mất hai giây');
    o += '<div class="card"><pre class="sm" style="white-space:pre-wrap;' +
      'overflow-x:auto;margin:0">' + h(d.chu) + '</pre></div>';
    return o;
  }

  /* ═══════════ NGĂN 3 · VÒNG CHẠY ═══════════ */
  function nganVong() {
    var l = G.BP_VONG_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<b>' + h(l.dungThuTu || '') + '</b>' +
      '<p class="sm mt">' + h(l.soanKhongDuocTuDuyet || '') + '</p>' +
      '<p class="sm mt">' + h(l.hauKiemNenNguoiVanPhaiDuyet || '') + '</p>' +
      '<p class="sm muted mt">' + h(l.soGhiTungLuot || '') + '</p></div>';

    o += U.tbl(['Bước', 'Vai', 'Ai làm', 'Vì sao'],
      (G.BP_VONG || []).map(function (b) {
        return ['<b class="sm">' + h(String(b.so)) + '. ' + h(b.buoc) + '</b>',
          '<span class="sm">' + h(b.vai || '—') + '</span>',
          '<span class="sm">' + (b.may ? 'Máy' : '<b>NGƯỜI</b>') + '</span>',
          '<span class="sm">' + h(b.y || '') +
            (b.doiNhaCungCapKhac
              ? ' <b style="color:var(--bad)">Nhà cung cấp phải khác bước 1.</b>'
              : '') + '</span>'];
      }));

    var of2 = G.BP_OFFLINE || {};
    o += U.sec('Chạy tại chỗ', of2.khiNao || '');
    o += '<div class="card" style="border-left:3px solid var(--bad)">' +
      '<p class="sm">' + h(of2.vi || '') + '</p>' +
      '<p class="sm mt">' + h(of2.cach || '') + '</p>' +
      '<p class="sm muted mt">' + h(of2.khongLuuSan || '') + '</p></div>';
    o += '<div class="card mt"><pre class="sm" style="white-space:pre-wrap;' +
      'overflow-x:auto;margin:0">' + h(G.bpModelfile().slice(0, 400) + '…') + '</pre></div>';
    return o;
  }

  /* ═══════════ NGĂN 4 · NỐI ═══════════ */
  function nganNoi() {
    var l = G.BP_NOI_LUAT || {};
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>' + h(l.khongDungPhanMemMoi || '') + '</b>' +
      '<p class="sm mt">' + h(l.cuaNaoCungQuaCongAnDanh || '') + '</p></div>';

    o += U.tbl(['Vai', 'Màn', 'Cửa', 'Đã có sẵn gì'],
      (G.BP_NOI || []).map(function (n) {
        return ['<b class="sm">' + h(n.vai) + '</b>',
          '<code class="sm">' + h(n.man) + '</code>',
          '<code class="sm">' + h(n.cua) + '</code>',
          '<span class="sm">' + h(n.daCo) + '</span>'];
      }));
    return o;
  }

  G.VIEWS['bo-prompt'] = function () {
    var o = '<div class="card" style="border-left:3px solid var(--gita)">' +
      '<b>BỘ PROMPT v3.0 — BỐN BẢN DÁN THẲNG</b>' +
      '<p class="sm muted mt">Màn này <b>dựng</b> prompt, nó không <b>giữ</b> prompt. ' +
      'Không một chữ nào của bốn prompt nằm trong kho — chúng được ghép lúc chạy từ ' +
      'chính các kho đã mở, nên sửa Hiến pháp ở một chỗ thì cả bốn prompt đổi theo ' +
      'ngay lượt dựng sau.</p></div>';

    if (!(G.BP_VAI4 || []).length)
      return o + U.empty('Bộ prompt chưa mở',
        'Kho nghề chưa nạp. Đăng nhập bằng vai có quyền nghề.', true);

    o += thanhNgan();
    if (G.bpNgan === 'dung') o += nganDung();
    else if (G.bpNgan === 'vong') o += nganVong();
    else if (G.bpNgan === 'noi') o += nganNoi();
    else o += nganVai();
    return o;
  };
})();
