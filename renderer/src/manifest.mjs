const RATIOS = {'9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080]};
const FPS = new Set([24, 25, 30, 60]);
const text = value => String(value || '').trim();

export function validateManifest(manifest) {
  const project = manifest && manifest.project ? manifest.project : manifest;
  const delivery = project && project.v20 && project.v20.delivery;
  const scenes = project && project.scenes;
  const expected = delivery && RATIOS[text(delivery.tiLe)];
  if (!delivery || text(delivery.phienBan) !== 'V20' || !expected ||
      Number(delivery.rong) !== expected[0] || Number(delivery.cao) !== expected[1] ||
      !FPS.has(Number(delivery.fps)) || !(Number(delivery.thoiLuongToiDa) >= 30 &&
      Number(delivery.thoiLuongToiDa) <= 300) || !text(delivery.template) || !text(delivery.kenh))
    throw new Error('Manifest V20 bàn giao không hợp lệ.');
  if (!Array.isArray(scenes) || !scenes.length)
    throw new Error('Manifest phải có ít nhất một cảnh.');
  const duration = scenes.reduce((total, scene) => total + Number(scene.giay || 0), 0);
  if (!(duration >= 30) || duration > Number(delivery.thoiLuongToiDa))
    throw new Error('Tổng thời lượng không thuộc giới hạn V20.');
  if (scenes.some(scene => !text(scene.id) || !text(scene.loi) || Number(scene.giay) <= 0))
    throw new Error('Mỗi cảnh phải có mã, lời thoại và thời lượng dương.');
  const assets = project.v20.threeD || [];
  if (!Array.isArray(assets) || assets.some(asset => asset.dinhDang !== 'GLB' ||
      !text(asset.giayPhep) || !text(asset.duongDan) || /^(https?:|file:)/i.test(asset.duongDan) ||
      !asset.pbr || !asset.shadow))
    throw new Error('Mỗi asset 3D phải là GLB có quyền, kho riêng, PBR và shadow.');
  const forbidden = ['hosoApp', 'khachHangId', 'customerId', 'email', 'phone', 'transcript'];
  const foundForbidden = (value, key = '') => {
    if (forbidden.includes(key)) return true;
    if (Array.isArray(value)) return value.some(item => foundForbidden(item));
    return value && typeof value === 'object' && Object.entries(value).some(
      ([childKey, child]) => foundForbidden(child, childKey));
  };
  if (foundForbidden(manifest)) throw new Error('Manifest renderer không được chứa dữ liệu hồ sơ hoặc liên hệ khách.');
  return {project, delivery, scenes, duration};
}
