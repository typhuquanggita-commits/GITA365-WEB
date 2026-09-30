/* GITA Studio — renderer WebGL cục bộ. Không tải mô hình, ảnh hay giọng ra mạng. */
'use strict';
var G = window.G || {}; window.G = G;

(function () {
  var U = G.U;
  var THU_VIEN_3D = [
    {ma: 'trainer-san-khau', ten: 'Trainer sân khấu', loai: 'nhan-vat',
      dinhDang: 'GLB', yeuCau: ['rig xương', 'blendshape khuôn mặt', 'walk', 'gesture', 'idle'],
      giayPhep: '', duongDan: ''},
    {ma: 'mc-truyen-hinh', ten: 'MC dẫn chương trình', loai: 'nhan-vat',
      dinhDang: 'GLB', yeuCau: ['rig xương', 'blendshape khuôn mặt', 'talk', 'gesture', 'idle'],
      giayPhep: '', duongDan: ''},
    {ma: 'hoi-truong-500', ten: 'Hội trường 500 người', loai: 'boi-canh',
      dinhDang: 'GLB', yeuCau: ['sân khấu', 'ánh sáng', 'khán giả'], giayPhep: '', duongDan: ''}
  ];
  G.xu3D = G.xu3D || {
    cheDo: 'webgl', nhanVat: 'trainer-san-khau', boiCanh: 'hoi-truong-500',
    khongGian: 'bang-dao-tao',
    dongYGiong: false, daDuyetQuyen: false, daDuyetNoiDung: false,
    timeline: {camXuc: 'tu-tin', dongTac: 'gesture', diChuyen: 'center-stage',
      camera: 'wide-dolly', anhSang: 'warm-stage', phuDe: true, lipSync: 'recorded-audio'},
    thuVien: THU_VIEN_3D
  };
  function h(s) { return U && U.h ? U.h(s) : String(s || ''); }
  function el(id) { return typeof document !== 'undefined' && document.getElementById(id); }
  function coWebGL() {
    try { var c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); }
    catch (e) { return false; }
  }
  function shader(gl, loai, ma) {
    var s = gl.createShader(loai); gl.shaderSource(s, ma); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  function veSanKhau(t) {
    var cv = el('xu-man-3d'); if (!cv) return false;
    var gl = cv.getContext('webgl', {preserveDrawingBuffer: true});
    if (!gl) return false;
    var W = cv.clientWidth || 720, H = cv.clientHeight || 405;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    var vs = shader(gl, gl.VERTEX_SHADER,
      'attribute vec2 p; attribute vec3 c; varying vec3 v; uniform float x; void main(){' +
      'float sway=sin(x*1.4)*.035; gl_Position=vec4(p.x+sway*(p.y+.2),p.y,0.,1.);v=c;}');
    var fs = shader(gl, gl.FRAGMENT_SHADER, 'precision mediump float;varying vec3 v;void main(){gl_FragColor=vec4(v,1.);}');
    if (!vs || !fs) return false;
    var pg = gl.createProgram(); gl.attachShader(pg, vs); gl.attachShader(pg, fs); gl.linkProgram(pg); gl.useProgram(pg);
    /* sàn phối cảnh, màn hình sân khấu, người dẫn trừu tượng gồm đầu/thân/tay.
       Renderer không giả là mô hình diễn viên: GLB có rig thật sẽ thay lớp này. */
    var d = new Float32Array([
      -1,-1,.05,.08,.15,  1,-1,.05,.08,.15,  0,.05,.12,.18,.30,
      -.82,-.20,.10,.12,.24, .82,-.20,.10,.12,.24, 0,.48,.22,.28,.52,
      -.74,.30,.10,.11,.22, .74,.30,.10,.11,.22, 0,.82,.38,.20,.08,
      -.15,.02,.10,.09,.11, .15,.02,.10,.09,.11, 0,.62,.18,.16,.22,
      -.10,.23,.09,.08,.12, .10,.23,.09,.08,.12, 0,.42,.16,.18,.25,
      -.38,.20,.11,.09,.12, -.10,.31,.11,.09,.12, -.14,.22,.11,.09,.12,
      .10,.31,.11,.09,.12, .38,.20,.11,.09,.12, .14,.22,.11,.09,.12
    ]);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
    var stride = 5 * 4, p = gl.getAttribLocation(pg, 'p'), c = gl.getAttribLocation(pg, 'c');
    gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(c); gl.vertexAttribPointer(c, 3, gl.FLOAT, false, stride, 8);
    gl.uniform1f(gl.getUniformLocation(pg, 'x'), t || 0); gl.viewport(0, 0, W, H);
    gl.clearColor(.018, .025, .06, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, d.length / 5);
    return true;
  }
  G.xu3DKiem = function () {
    var x = G.xu3D, thieu = x.thuVien.filter(function (a) { return !a.giayPhep || !a.duongDan; });
    return {
      webgl: coWebGL(), sanSang: !thieu.length && x.dongYGiong && x.daDuyetQuyen && x.daDuyetNoiDung,
      thieu: thieu.map(function (a) { return a.ten; })
    };
  };
  G.xu3DVe = function (t) {
    if (!veSanKhau(t || 0)) { G.xu3D.cheDo = '2d'; return false; }
    return true;
  };
  G.xu3DChon = function (o, v) {
    if (o === 'dongYGiong' || o === 'daDuyetQuyen' || o === 'daDuyetNoiDung') G.xu3D[o] = !!v;
    else if (Object.prototype.hasOwnProperty.call(G.xu3D.timeline, o)) G.xu3D.timeline[o] = v;
    else G.xu3D[o] = v;
    G.render && G.render();
  };
  G.xu3DTaiDemo = function () {
    G.xu3D.nhanVat = 'trainer-san-khau'; G.xu3D.boiCanh = 'hoi-truong-500';
    G.xu3D.khongGian = 'san-khau-huan-luyen';
    G.xu3D.timeline = {camXuc: 'tu-tin', dongTac: 'gesture', diChuyen: 'center-stage',
      camera: 'wide-dolly', anhSang: 'warm-stage', phuDe: true, lipSync: 'recorded-audio'};
    G.render && G.render();
  };
  G.xu3DNapMauGioiThieu = function () {
    if (!G.xuDA) return;
    var mau = [
      ['Hook', 'Gia đình không cần làm nhiều hơn. Gia đình cần cùng đi đúng một hướng.', 6],
      ['Giới thiệu GITA365', 'GITA365 là nơi cả nhà cùng nhìn lại, chọn một điều nhỏ, rồi làm đều mỗi ngày.', 6],
      ['Trên bảng', 'Hôm nay, Trainer cùng bạn bắt đầu từ ba câu hỏi: gia đình đang ở đâu, cần điều gì, và cùng làm việc gì trước.', 7],
      ['Ví dụ', 'Thay vì nhắc con hãy cố gắng, hãy hỏi: hôm nay điều gì khó nhất để bố mẹ cùng giúp?', 6],
      ['Tình huống', 'Khi mọi người bận rộn, chỉ cần năm phút sau bữa tối để lắng nghe nhau là đủ để giữ nhịp.', 6],
      ['Bài học', 'Một thay đổi nhỏ được lặp lại sẽ trở thành nền móng cho sự tin cậy trong nhà.', 5],
      ['Lời mời gia đình', 'Mỗi gia đình đều mong được hiểu nhau hơn và có một hành trình bình an hơn.', 5],
      ['Hoạt động cùng Trainer', 'Mời cả nhà đứng trước bảng, chọn một việc chung trong tuần này, và cùng nói lời cam kết.', 7]
    ];
    G.xuDA.ten = 'Video mẫu · Giới thiệu GITA365 cùng Trainer';
    G.xuDA.dich = 48; G.xuDA.nguon = 'Video mẫu Studio · Giới thiệu GITA365';
    G.xuDA.dieuNho = 'Cả nhà chọn một việc chung và thực hiện trong tuần này.';
    G.xuDA.mc.vaiDan = 'trainer'; G.xuDA.mc.hinh = 'trainer-quang-mau';
    if (!G.xuVat['trainer-quang-mau'] && typeof Image !== 'undefined') {
      var anh = new Image(); G.xuVat['trainer-quang-mau'] = {ma: 'trainer-quang-mau',
        ten: 'Trainer Quang · ảnh do chủ sở hữu cung cấp', loai: 'hinh', el: anh, mau: true};
      anh.onload = function () { G.xuVe && G.xuVe(G.xuDongHo || 0); };
      anh.src = 'assets/anh/trainer-quang.png';
    }
    G.xuDA.canh = mau.map(function (p, i) {
      return {id: 'mau-gita-' + i, vai: 'mau-' + i, giay: p[2], loi: p[1], chuMan: p[0],
        hinh: 'Trainer đứng bên bảng · chuyển động máy quay nhẹ · phụ đề', vatHinh: '',
        vatTieng: '', sacThai: i === 0 || i === 7 ? 'truyen-cam-hung' : 'than-thien'};
    });
    G.xu3D.khongGian = 'bang-dao-tao'; G.xuSoat = null; G.xuDongHo = 0;
    G.render && G.render();
  };
  G.xu3DDocMau = function () {
    if (!window.speechSynthesis || !G.xuDA || !(G.xuDA.canh || []).length) {
      if (U && U.toast) U.toast('Trình duyệt này chưa có giọng đọc mẫu.', 'err');
      return;
    }
    window.speechSynthesis.cancel();
    var text = G.xuDA.canh.map(function (c) { return c.loi; }).join(' ');
    var u = new SpeechSynthesisUtterance(text); u.lang = 'vi-VN'; u.rate = .94; u.pitch = 1;
    /* Giọng là giọng hệ điều hành đang dùng, không phải bản sao giọng của Trainer. */
    window.speechSynthesis.speak(u);
  };
  G.xu3DDungDoc = function () { if (window.speechSynthesis) window.speechSynthesis.cancel(); };
  G.xu3DNhacMoDau = function () {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    var a = new AC(), now = a.currentTime;
    [261.63, 329.63, 392].forEach(function (hz, i) {
      var o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.value = hz; g.gain.setValueAtTime(.0001, now + i * .14);
      g.gain.exponentialRampToValueAtTime(.09, now + i * .14 + .03);
      g.gain.exponentialRampToValueAtTime(.0001, now + i * .14 + .42);
      o.connect(g); g.connect(a.destination); o.start(now + i * .14); o.stop(now + i * .14 + .45);
    });
  };
  G.xu3DXemMau = function () {
    G.xu3DNapMauGioiThieu(); G.xu3DNhacMoDau();
    setTimeout(function () { if (G.xuXem) G.xuXem(); }, 20);
  };
  G.xu3DPanel = function () {
    var k = G.xu3DKiem(), x = G.xu3D, tl = x.timeline;
    return '<div class="giay"><h3>3D · Người dẫn &amp; không gian đào tạo</h3>' +
      '<p class="note">Ưu tiên MC/Trainer đứng chia sẻ và đào tạo trên bảng. Sân khấu/hội trường chỉ dành cho video huấn luyện. Renderer WebGL chạy tại thiết bị. Không tải hình, mô hình hoặc giọng sang dịch vụ ngoài. ' +
      'Bản xem thử dưới đây là sân khấu 3D kỹ thuật; chỉ dùng nhân vật diễn xuất khi mô hình GLB đã được cấp phép, có rig và blendshape.</p>' +
      '<canvas id="xu-man-3d" class="xu-man" style="max-height:405px" aria-label="Xem thử sân khấu 3D"></canvas>' +
      '<div class="row"><button class="btn btn-chinh" onclick="G.xu3DXemMau()">Xem video mẫu · Giới thiệu GITA365</button>' +
      '<button class="btn" onclick="G.xu3DNapMauGioiThieu()">Nạp để biên tập</button>' +
      '<button class="btn" onclick="G.xu3DDocMau()">Nghe lời đọc mẫu</button><button class="btn" onclick="G.xu3DDungDoc()">Dừng lời đọc</button></div>' +
      '<div class="row"><label>Không gian <select onchange="G.xu3DChon(\'khongGian\',this.value)">' +
      '<option value="bang-dao-tao"' + (x.khongGian === 'bang-dao-tao' ? ' selected' : '') + '>Bảng đào tạo · mặc định</option>' +
      '<option value="san-khau-huan-luyen"' + (x.khongGian === 'san-khau-huan-luyen' ? ' selected' : '') + '>Sân khấu · chỉ video huấn luyện</option>' +
      '</select></label><button class="btn" onclick="G.xu3DVe(performance.now()/1000)">Xem không gian WebGL</button>' +
      '<button class="btn" onclick="G.xu3DTaiDemo()">Nạp demo Trainer · hội trường 500</button></div>' +
      '<div class="row"><label>Cảm xúc <select onchange="G.xu3DChon(\'camXuc\',this.value)">' +
      ['tu-tin','am-ap','truyen-cam-hung','binh-tinh'].map(function (v) { return '<option' + (tl.camXuc === v ? ' selected' : '') + '>' + h(v) + '</option>'; }).join('') +
      '</select></label><label>Động tác <select onchange="G.xu3DChon(\'dongTac\',this.value)">' +
      ['idle','gesture','walk','point'].map(function (v) { return '<option' + (tl.dongTac === v ? ' selected' : '') + '>' + h(v) + '</option>'; }).join('') +
      '</select></label><label>Máy quay <select onchange="G.xu3DChon(\'camera\',this.value)">' +
      ['wide-dolly','medium','audience'].map(function (v) { return '<option' + (tl.camera === v ? ' selected' : '') + '>' + h(v) + '</option>'; }).join('') +
      '</select></label></div>' +
      '<label class="note"><input type="checkbox"' + (x.dongYGiong ? ' checked' : '') + ' onchange="G.xu3DChon(\'dongYGiong\',this.checked)"> Tôi có sự đồng ý rõ ràng để dùng giọng thu.</label>' +
      '<label class="note"><input type="checkbox"' + (x.daDuyetQuyen ? ' checked' : '') + ' onchange="G.xu3DChon(\'daDuyetQuyen\',this.checked)"> Tôi đã kiểm quyền sử dụng nhân vật, trang phục, cảnh và animation.</label>' +
      '<label class="note"><input type="checkbox"' + (x.daDuyetNoiDung ? ' checked' : '') + ' onchange="G.xu3DChon(\'daDuyetNoiDung\',this.checked)"> Tôi đã duyệt lời thoại; không giả mạo người thật không được phép.</label>' +
      '<p class="note">Nút xem mẫu dùng hiệu ứng mở đầu được tạo cục bộ; nhạc nền đầy đủ vẫn chọn từ tệp được cấp phép trong Kho hình &amp; tiếng. Giọng đọc mẫu là giọng hệ điều hành, không mô phỏng Trainer. ' +
      (k.webgl ? 'WebGL sẵn sàng.' : 'Thiết bị không hỗ trợ WebGL: Studio giữ preview 2.5D.') +
      (k.thieu.length ? ' Còn thiếu hồ sơ/tệp cục bộ: ' + h(k.thieu.join(' · ')) + '.' : '') + '</p></div>';
  };
})();
