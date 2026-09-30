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
  G.xu3DPanel = function () {
    var k = G.xu3DKiem(), x = G.xu3D, tl = x.timeline;
    return '<div class="giay"><h3>3D · Người dẫn &amp; không gian đào tạo</h3>' +
      '<p class="note">Ưu tiên MC/Trainer đứng chia sẻ và đào tạo trên bảng. Sân khấu/hội trường chỉ dành cho video huấn luyện. Renderer WebGL chạy tại thiết bị. Không tải hình, mô hình hoặc giọng sang dịch vụ ngoài. ' +
      'Bản xem thử dưới đây là sân khấu 3D kỹ thuật; chỉ dùng nhân vật diễn xuất khi mô hình GLB đã được cấp phép, có rig và blendshape.</p>' +
      '<canvas id="xu-man-3d" class="xu-man" style="max-height:405px" aria-label="Xem thử sân khấu 3D"></canvas>' +
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
      '<p class="note">' + (k.webgl ? 'WebGL sẵn sàng.' : 'Thiết bị không hỗ trợ WebGL: Studio giữ preview 2.5D.') +
      (k.thieu.length ? ' Còn thiếu hồ sơ/tệp cục bộ: ' + h(k.thieu.join(' · ')) + '.' : '') + '</p></div>';
  };
})();
