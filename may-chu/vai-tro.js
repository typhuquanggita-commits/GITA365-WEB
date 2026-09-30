export const REGEX_NGUOI_NHA = /^R(0[1-9]|1[0-2])$/;
export const BAC = Object.freeze({
  R01: 1, R02: 2, R03: 3, R04: 4, R05: 5, R06: 6, R07: 7, R08: 8,
  R09: 9, R10: 10, R11: 11, R12: 12, R13: 13, R14: 14, R15: 15
});

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
  return BAC[roleOf(hoSo)] || 99;
}
