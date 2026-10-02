/* Sổ điều hành: chỉ lưu việc vận hành, không lưu dữ liệu khách hay secret. */
'use strict';
import { roleOf, tenNguoiDung } from './vai-tro.js';

const LOAI = new Set(['suCo', 'phatHanh', 'caiTien']);
const TRANG_THAI = new Set(['moi', 'dangLam', 'choDuyet', 'dong']);
const cap = h => ['R01', 'R02'].includes(roleOf(h));
const text = (x, n) => String(x || '').trim().slice(0, n);
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID().replace(/-/g, '');
function bad(error) { return {ok: false, error}; }

export async function docSoVanHanh(y, env, db, hoSo) {
  if (!cap(hoSo)) return bad('Sổ điều hành chỉ mở cho R01 và R02.');
  const rows = await db.prepare(
    'SELECT id,kind,status,title,owner,reviewer,ref,rollbackRef,evidence,createdBy,createdAt,updatedAt,closedAt FROM operationsLedger ORDER BY CASE status WHEN ? THEN 0 WHEN ? THEN 1 WHEN ? THEN 2 ELSE 3 END, updatedAt DESC LIMIT 100'
  ).bind('moi', 'dangLam', 'choDuyet').all();
  return {ok: true, items: rows.results || []};
}

export async function ghiSoVanHanh(y, env, db, hoSo) {
  if (!cap(hoSo)) return bad('Sổ điều hành chỉ mở cho R01 và R02.');
  const kind = text(y.kind, 20), title = text(y.title, 160);
  const owner = text(y.owner, 80), ref = text(y.ref, 240), rollbackRef = text(y.rollbackRef, 240);
  if (!LOAI.has(kind) || title.length < 5 || owner.length < 2)
    return bad('Cần chọn loại việc, mô tả ít nhất 5 ký tự và người chịu trách nhiệm.');
  const t = now(), item = {id: id(), kind, status: 'moi', title, owner, reviewer: '',
    ref, rollbackRef, evidence: '', createdBy: tenNguoiDung(hoSo), createdAt: t, updatedAt: t, closedAt: ''};
  await db.prepare('INSERT INTO operationsLedger (id,kind,status,title,owner,reviewer,ref,rollbackRef,evidence,createdBy,createdAt,updatedAt,closedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(item.id, item.kind, item.status, item.title, item.owner, '', item.ref, item.rollbackRef, '',
      item.createdBy, t, t, '').run();
  return {ok: true, item};
}

export async function capNhatSoVanHanh(y, env, db, hoSo) {
  if (!cap(hoSo)) return bad('Sổ điều hành chỉ mở cho R01 và R02.');
  const itemId = text(y.id, 64), status = text(y.status, 20);
  const reviewer = text(y.reviewer, 80), evidence = text(y.evidence, 1000);
  if (!itemId || !TRANG_THAI.has(status)) return bad('Dữ liệu vận hành không hợp lệ.');
  if ((status === 'choDuyet' || status === 'dong') && (!reviewer || evidence.length < 10))
    return bad('Chờ duyệt/đóng việc cần người duyệt và bằng chứng hoặc kết quả ít nhất 10 ký tự.');
  const old = await db.prepare('SELECT id FROM operationsLedger WHERE id=?').bind(itemId).first();
  if (!old) return bad('Không tìm thấy việc vận hành.');
  const t = now(), closedAt = status === 'dong' ? t : '';
  await db.prepare('UPDATE operationsLedger SET status=?,reviewer=?,evidence=?,updatedAt=?,closedAt=? WHERE id=?')
    .bind(status, reviewer, evidence, t, closedAt, itemId).run();
  return {ok: true};
}
