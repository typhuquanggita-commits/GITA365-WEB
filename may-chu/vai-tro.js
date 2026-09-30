export const REGEX_NGUOI_NHA = /^R(0[1-9]|1[0-2])$/;

export function roleOf(hoSo) {
  return String((hoSo || {}).role || '');
}

export function laNguoiNha(hoSo) {
  return REGEX_NGUOI_NHA.test(roleOf(hoSo));
}

export function laR01(hoSo) {
  return roleOf(hoSo) === 'R01';
}

export function tenNguoiDung(hoSo) {
  return String((hoSo || {}).u || '');
}

export function bacVai(hoSo) {
  const role = roleOf(hoSo);
  return /^R(0[1-9]|1[0-5])$/.test(role) ? Number(role.slice(1)) : 99;
}
